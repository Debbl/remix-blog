import { Button, Input, Textarea } from "@nextui-org/react";
import { json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { prisma } from "~/prisma.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

export async function loader(c: LoaderFunctionArgs) {
  const postId = c.params.postId as string;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Response("找不到文章", {
      status: 404,
    });
  }

  return json({
    post,
  });
}

export async function action(c: ActionFunctionArgs) {
  const postId = c.params.postId as string;

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });
  return redirect("/");
}

export default function Page() {
  const loaderData = useLoaderData<typeof loader>();

  const deleteFetcher = useFetcher();

  const isDeleting = deleteFetcher.state === "submitting";

  return (
    <div className="p-12">
      <Form method="POST">
        <div className="flex flex-col gap-3">
          <Input label="slug" name="slug" defaultValue={loaderData.post.id} />
          <Input
            label="标题"
            name="title"
            defaultValue={loaderData.post.title}
          />
          <Textarea
            minRows={10}
            label="正文"
            name="content"
            defaultValue={loaderData.post.content}
          />
        </div>
      </Form>
      <div className="mt-8 w-full">
        <deleteFetcher.Form
          method="POST"
          action={`/posts/${loaderData.post.id}/delete`}
        >
          <div className="flex flex-col">
            <Button
              isLoading={isDeleting}
              color="danger"
              onClick={(_) => {
                // eslint-disable-next-line no-alert
                if (confirm("确认删除吗？")) {
                  deleteFetcher.submit(null, {
                    method: "POST",
                    action: `/posts/${loaderData.post.id}/delete`,
                  });
                }
              }}
            >
              删除
            </Button>
          </div>
        </deleteFetcher.Form>
      </div>
    </div>
  );
}
