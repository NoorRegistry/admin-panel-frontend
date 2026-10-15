"use client";
import constants from "@/constants";
import { IApiError } from "@/api/http";
import LanguageMenu from "@/components/LanguageMenu";
import { ILoginPayload, login } from "@/services/login.service";
import { useGlobalStore } from "@/store";
import { setStorageItem } from "@/utils/storage";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FeatureCarousel from "./feature-carousel";
import styles from "./login.module.css";

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm<ILoginPayload>();
  useEffect(() => {
    const names = form
      .getFieldsError()
      .filter((field) => field.errors.length)
      .map((field) => field.name);
    if (names.length) void form.validateFields(names).catch(() => {});
  }, [form, i18n.language]);
  const signin = useGlobalStore.use.signIn();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: (data: ILoginPayload) => login(data),
    onSuccess: (response) => {
      setStorageItem(constants.ACCESS_TOKEN, JSON.stringify(response));
      signin();
      router.replace("/");
    },
  });
  const error = mutation.error as IApiError | null;
  return (
    <main className={styles.page}>
      <FeatureCarousel />
      <section className={styles.formSide}>
        <header className={styles.formHeader}>
          <strong className={styles.mobileBrand}>Shop Simplist</strong>
          <LanguageMenu />
        </header>
        <div className={styles.formContainer}>
          <h1>{t("login.signIn")}</h1>
          {mutation.isError && (
            <Alert
              role="alert"
              type="error"
              showIcon
              title={
                error?.status === 401
                  ? t("login.invalidCredentials")
                  : error?.detail || t("login.loginFailed")
              }
              className={styles.error}
            />
          )}
          <Form
            form={form}
            name="login"
            onFinish={(values: ILoginPayload) => mutation.mutate(values)}
            onValuesChange={() => {
              if (mutation.isError) mutation.reset();
            }}
            layout="vertical"
            requiredMark={false}
            clearOnDestroy
            disabled={mutation.isPending}
          >
            <Form.Item
              name="email"
              label={t("common.email")}
              rules={[
                { required: true, message: t("login.enterEmail") },
                { type: "email", message: t("login.enterValidEmail") },
              ]}
              normalize={(value: string) => value.trim()}
            >
              <Input
                autoComplete="username"
                inputMode="email"
                type="email"
                placeholder="you@company.com"
                dir="ltr"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={t("login.password")}
              rules={[{ required: true, message: t("login.enterPassword") }]}
            >
              <Input.Password autoComplete="current-password" dir="ltr" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={mutation.isPending}
              className={styles.submit}
            >
              {t("login.signIn")}
            </Button>
          </Form>
        </div>
        <footer className={styles.footer}>
          © {new Date().getFullYear()} Shop Simplist
        </footer>
      </section>
    </main>
  );
}
