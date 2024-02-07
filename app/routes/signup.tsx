import { Button, Input } from "@nextui-org/react";
import { ActionFunction, ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { prisma } from "~/prisma.server";

export async function action(c: ActionFunctionArgs) {
  const formData = await c.request.formData();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const isExist =
    (await prisma.user.count({
      where: {
        username,
      },
    })) !== 0;
  if (isExist) {
    return redirect("/signin");
  }

  await prisma.user.create({
    data: {
      username,
      password,
    },
  });

  return redirect("/signin");
}

export default function Page() {
  return (
    <Form method="POST">
      <div className="p-12 flex flex-col gap-3">
        <Input label="用户名" name="username" />
        <Input type="password" label="密码" name="password" />
        <Button type="submit" color="primary">
          注册
        </Button>
      </div>
    </Form>
  );
}
