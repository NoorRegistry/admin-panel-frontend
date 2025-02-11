const endpoints = {
  authentication: {
    login: "/v1/api/admin/auth/login",
    register: "/v1/api/admin/auth/register",
    refreshToken: "/v1/api/admin/auth/refresh",
    googleLogin: "/v1/api/admin/auth/google",
  },
  stores: {
    index: "/v1/api/admin/stores",
  },
  products: {
    index: "/v1/api/admin/products",
  },
  upload: {
    index: "/v1/api/admin/upload",
  },
  statistics: {
    index: "/v1/api/admin/statistics",
  },
  guides: {
    index: "/v1/api/admin/guides",
  },
};

export default endpoints;
