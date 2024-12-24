import { IApiError } from "@/api/http";
import { postStoreAdmin } from "@/services/stores.service";
import { TCreateStoreAdmin } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Button, Flex, Form, Input, Modal, message } from "antd";
import { useTranslation } from "react-i18next";
import { ICreateStoreAdminConfig } from "../../stores.types";
import formValidations from "@/constants/formValidations";

function CreateStoreAdmin({
  config,
  onClose,
}: {
  config: ICreateStoreAdminConfig;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const createStoreAdminMutation = useMutation({
    mutationFn: (data: TCreateStoreAdmin) =>
      postStoreAdmin({ ...data, storeId: config.storeId! }),
    onSuccess: () => {
      messageApi.success({
        content: t("stores.adminCreatedSuccessfully"),
      });
      onClose();
    },
    onError: (err: IApiError) => {
      messageApi.error({
        content: err.detail,
      });
    },
  });

  const handleCreateStoreAdmin = (store: TCreateStoreAdmin) => {
    createStoreAdminMutation.mutate(store);
  };

  return (
    <>
      {contextHolder}
      <Modal
        centered
        onClose={onClose}
        onCancel={onClose}
        title={t("stores.createAdmin", { name: config.storeName })}
        open={config.open}
        footer={
          <Flex align="end" justify="end" gap={16}>
            <Button onClick={onClose}>{t("common.cancel")}</Button>
            <Button
              type="primary"
              htmlType="submit"
              form="createStoreAdmin"
              loading={createStoreAdminMutation.isPending}
            >
              {t("common.submit")}
            </Button>
          </Flex>
        }
        destroyOnClose
      >
        <Form<TCreateStoreAdmin>
          form={form}
          id="createStoreAdmin"
          layout="vertical"
          name="createStoreAdmin"
          onFinish={handleCreateStoreAdmin}
          autoComplete="off"
          clearOnDestroy
        >
          <Form.Item<TCreateStoreAdmin>
            label={t("common.firstName")}
            name="firstName"
            rules={[{ required: true, message: t("common.required") }]}
          >
            <Input placeholder="Enter your first name" maxLength={formValidations?.cmsAdmins?.firstName} />
          </Form.Item>

          <Form.Item<TCreateStoreAdmin>
            label={t("common.lastName")}
            name="lastName"
            rules={[{ required: true, message: t("common.required") }]}
          >
            <Input placeholder="Enter your last name" maxLength={formValidations?.cmsAdmins?.lastName} />
          </Form.Item>

          <Form.Item<TCreateStoreAdmin>
            label={t("common.email")}
            name="email"
            rules={[
              { required: true, message: t("login.enterEmail") },
              { type: "email", message: t("login.enterValidEmail") },
            ]}
          >
            <Input placeholder="Enter your email" maxLength={formValidations?.cmsAdmins?.email} />
          </Form.Item>

          <Form.Item<TCreateStoreAdmin>
            label={t("login.password")}
            name="password"
            rules={[{ required: true, message: t("common.required") }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default CreateStoreAdmin;
