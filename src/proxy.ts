import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];

const isAuthRoute = createRouteMatcher(AUTH_ROUTES);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  let isAuthenticated: boolean | null = null;
  const checkIsAuthenticated = async () => {
    if (isAuthenticated === null) {
      isAuthenticated = await convexAuth.isAuthenticated();
    }
    return isAuthenticated;
  };

  if (!isAuthRoute(request) && !(await checkIsAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }

  if (isAuthRoute(request) && (await checkIsAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
