import { Button, Input } from "@nextui-org/react";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { prisma } from "~/prisma.server";
import { userSessionStorage } from "./session.server";
import type { ActionFunctionArgs } from "@remix-run/node";

export async function action(c: ActionFunctionArgs) {
  const formData = await c.request.formData();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: {
      username,
      password,
    },
  });

  if (!user) {
    return json({
      success: false,
      errors: {
        username: "用户名或密码不正确",
      },
    });
  }

  const session = await userSessionStorage.getSession(
    c.request.headers.get("Cookie"),
  );
  session.set("username", username);

  return redirect("/", {
    headers: {
      "Set-Cookie": await userSessionStorage.commitSession(session),
    },
  });
}

export default function Page() {
  return (
    <Form method="POST">
      <div className="flex flex-col gap-3 p-12">
        <Input label="用户名" name="username" />
        <Input type="password" label="密码" name="password" />
        <Button type="submit" color="primary">
          登录
        </Button>
      </div>
    </Form>
  );
}
