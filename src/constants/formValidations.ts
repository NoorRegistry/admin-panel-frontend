const formValidations = {
  appUsers: {
    firstName: 50,
    lastName: 50,
    email: 50,
  },
  cmsAdmins: {
    email: 50,
    firstName: 50,
    lastName: 50,
  },
  productCategory: {
    nameEn: 50,
    nameAr: 50,
    descriptionEn: 200,
    descriptionAr: 200,
  },
  products: {
    nameEn: 50,
    nameAr: 50,
    descriptionEn: 200,
    descriptionAr: 200,
  },
  registries: {
    title: 100,
    greeting: 500,
  },
  registryCategories: {
    nameEn: 50,
    nameAr: 50,
    descriptionEn: 200,
    descriptionAr: 200,
  },
  registryPurchases: {
    name: 50,
    email: 50,
    platform: 100,
  },
  Stores: {
    nameEn: 50,
    nameAr: 50,
    descriptionEn: 200,
    descriptionAr: 200,
    locationEn: 200,
    locationAr: 200,
    email: 50,
  },
};

export default formValidations;
