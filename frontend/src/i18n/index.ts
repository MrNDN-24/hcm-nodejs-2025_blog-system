import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

//VN
import viRegister from "./vi/register.json";
import viLogin from "./vi/login.json";
import viCommon from "./vi/common.json";
import viForgotPass from "./vi/forgotPass.json";
import viAuth from "./vi/auth.json";
import viNavbar from "./vi/navbar.json";
import viFooter from "./vi/footer.json";
import viHome from "./vi/home.json";
import viProfile from "./vi/profile.json";
import viUser from "./vi/user.json";
import viAuthor from "./vi/author.json";
import viPostModal from "./vi/postModal.json";
import viPost from "./vi/post.json";
import vipostManagement from "./vi/postManagement.json";
import viBlog from "./vi/blog.json";
import viComment from "./vi/comments.json";

//US
import enRegister from "./en/register.json";
import enLogin from "./en/login.json";
import enCommon from "./en/common.json";
import enForgotPass from "./en/forgotPass.json";
import enAuth from "./en/auth.json";
import enNavbar from "./en/navbar.json";
import enFooter from "./en/footer.json";
import enHome from "./en/home.json";
import enProfile from "./en/profile.json";
import enUser from "./en/user.json";
import enAuthor from "./en/author.json";
import enPostModal from "./en/postModal.json";
import enPost from "./en/post.json";
import enpostManagement from "./en/postManagement.json";
import enBlog from "./en/blog.json";
import enComment from "./en/comments.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        register: viRegister,
        login: viLogin,
        common: viCommon,
        forgotPass: viForgotPass,
        auth: viAuth,
        navbar: viNavbar,
        footer: viFooter,
        home: viHome,
        profile: viProfile,
        user: viUser,
        author: viAuthor,
        postModal: viPostModal,
        post: viPost,
        postManagement: vipostManagement,
        blog: viBlog,
        comments: viComment,
      },
      en: {
        register: enRegister,
        login: enLogin,
        common: enCommon,
        forgotPass: enForgotPass,
        auth: enAuth,
        navbar: enNavbar,
        footer: enFooter,
        home: enHome,
        profile: enProfile,
        user: enUser,
        author: enAuthor,
        postModal: enPostModal,
        post: enPost,
        postManagement: enpostManagement,
        blog: enBlog,
        comments: enComment,
      },
    },
    fallbackLng: "vi",
    ns: [
      "register",
      "login",
      "common",
      "forgotPass",
      "auth",
      "navbar",
      "footer",
      "home",
      "profile",
      "user",
      "author",
      "postModal",
      "post",
      "postManagement",
      "blog",
      "comments",
    ],

    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
