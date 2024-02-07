import { createCookieSessionStorage } from "@remix-run/node";

export interface UserSessionData {
  username: string;
}

export const userSessionStorage = createCookieSessionStorage<UserSessionData>({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 过期时间，这里为一天
    path: "/",
    sameSite: "lax",
    // 加密密钥
    // eslint-disable-next-line n/prefer-global/process
    secrets: [process.env.SESSION_SECRET as string],
    secure: true,
  },
});

export const auth = async (request: Request) => {
  const session = await userSessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  return {
    username: session.get("username"),
  } as UserSessionData;
};
