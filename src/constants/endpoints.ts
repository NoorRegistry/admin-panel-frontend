const endpoints = {
  authentication: {
    login: "/v1/api/admin/auth/login",
    register: "/v1/api/admin/auth/register",
    refreshToken: "/v1/api/admin/auth/refresh",
  },
  stores: {
    index: "/v1/api/stores",
  },
  products: {
    index: "/v1/api/products",
  },
  upload: {
    index: "/v1/api/admin/upload",
  },
  statistics: {
    index: "/v1/api/admin/statistics",
  },
};

export default endpoints;
