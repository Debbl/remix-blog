import { Pagination } from "@nextui-org/react";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { prisma } from "~/prisma.server";

const PAGE_SIZE = 1;
export async function loader(c: LoaderFunctionArgs) {
  const search = new URL(c.request.url).searchParams;
  const page = Number(search.get("page") || 1);

  // 用 prisma.$transaction() 进行组合查询
  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      orderBy: {
        created_at: "desc",
      },
      // 分页查询
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.post.count(),
  ]);

  return json({
    posts,
    pageCount: Math.ceil(total / PAGE_SIZE),
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  return (
    <div>
      <div className="flex flex-col gap-4 p-12">
        {loaderData.posts.map((post) => {
          return (
            <div key={post.id}>
              <Link to={`/posts/${post.id}`} className="text-xl">
                {post.title}
              </Link>
              <div className="text-sm text-gray-400">{post.created_at}</div>
            </div>
          );
        })}
      </div>
      <Pagination
        className="w-full"
        page={page}
        total={loaderData.pageCount}
        onChange={(page) => {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("page", String(page));
          setSearchParams(newSearchParams);
        }}
      />
    </div>
  );
}
