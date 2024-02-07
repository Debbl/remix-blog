import { Button, Input, Textarea } from "@nextui-org/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { prisma } from "~/prisma.server";
import { auth } from "./session.server";

export async function loader(c: LoaderFunctionArgs) {
  const user = await auth(c.request);
  if (!user.username) {
    return redirect("/signin");
  }

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
  const formData = await c.request.formData();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const slug = formData.get("slug") as string;

  const action = formData.get("action") as "delete" | "edit";

  if (action === "delete") {
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });
    return redirect("/");
  }

  // update
  if (!slug || !title || !content) {
    return json({
      success: false,
      errors: {
        slug: !slug && "必须填写 slug",
        title: !title && "必须填写标题",
        content: !content && "必须填写内容",
      },
    });
  }

  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      id: slug,
      title,
      content,
    },
  });
  return redirect(`/posts/${slug}`);
}

export default function Page() {
  const loaderData = useLoaderData<typeof loader>();
  const { id, title, content } = loaderData.post;

  const navigation = useNavigation();

  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  const submit = useSubmit();

  const isDeleting =
    navigation.state === "submitting" &&
    navigation.formData?.get("action") === "delete";
  const isEditing =
    navigation.state === "submitting" &&
    navigation.formData?.get("action") === "edit";

  return (
    <div className="p-12">
      <Form method="POST">
        <div className="flex flex-col gap-3">
          <Input
            isInvalid={!!errors?.slug}
            errorMessage={errors?.slug}
            label="slug"
            name="slug"
            defaultValue={id}
          />
          <Input
            isInvalid={!!errors?.title}
            errorMessage={errors?.title}
            label="标题"
            name="title"
            defaultValue={title}
          />
          <Textarea
            isInvalid={!!errors?.content}
            errorMessage={errors?.content}
            minRows={10}
            label="正文"
            name="content"
            defaultValue={content}
          />
          <Button
            name="action"
            value="edit"
            isLoading={isEditing}
            type="submit"
            color="primary"
          >
            更新
          </Button>
          <Button
            name="action"
            value="delete"
            isLoading={isDeleting}
            color="danger"
            onClick={(_) => {
              if (confirm("确认删除吗？")) {
                const formData = new FormData();
                formData.set("action", "delete");
                submit(formData, {
                  method: "POST",
                  action: `/posts/${loaderData.post.id}/delete`,
                });
              }
            }}
          >
            删除
          </Button>
        </div>
      </Form>

      <Link
        className="mt-8 inline-block"
        to={`/posts/${loaderData.post.id}/delete`}
      >
        <Button>删除</Button>
      </Link>
    </div>
  );
}
