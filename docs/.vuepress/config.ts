import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import { hopeTheme } from "vuepress-theme-hope";

export default defineUserConfig({
  // 网站基础配置
  base: "/dontalk.github.io/",
  lang: "zh-CN",
  title: "DonTalk 的个人博客",
  description: "Java 程序员的技术归档笔记，涵盖 Java 核心、数据库、微服务、分布式系统等全栈技术",
  dest: "./dist",
  
  // 使用 Vite 打包工具
  bundler: viteBundler(),

  // 主题配置
  theme: hopeTheme({
    hostname: "https://dontalk.github.io",
    
    // 作者信息
    author: {
      name: "DonTalk",
      url: "https://dontalk.github.io",
    },
    
    // 图标配置
    iconAssets: "fontawesome-with-brands",
    
    // 仓库地址
    repo: "dontalk/dontalk.github.io",
    
    // 导航栏配置
    navbarLayout: {
      start: ["Brand"],
      center: [],
      end: ["Links", "Language", "Repo", "Outlook", "Search"],
    },
    
    // 导航栏链接
    navbar: [
      { text: "首页", icon: "home", link: "/" },
      { 
        text: "技术分类", 
        icon: "folder", 
        children: [
          { text: "Java 核心", icon: "java", link: "/01-Java语言核心/" },
          { text: "数据库", icon: "database", link: "/02-数据库与持久化/" },
          { text: "Web 框架", icon: "code", link: "/03-Web与微服务框架/" },
          { text: "工程化", icon: "tools", link: "/04-工程化与生产实践/" },
          { text: "分布式架构", icon: "network-wired", link: "/05-分布式系统与架构/" },
          { text: "性能优化", icon: "tachometer-alt", link: "/06-性能优化与调优/" },
          { text: "云原生", icon: "cloud", link: "/08-云原生与容器化/" },
          { text: "AI 应用", icon: "robot", link: "/17-AI 与智能应用/" },
        ]
      },
      { text: "项目案例", icon: "briefcase", link: "/15-项目案例与复盘/" },
      { text: "标签", icon: "tags", link: "/tag/" },
    ],
    
    // 侧边栏配置（根据目录结构自动生成）
    sidebar: "structure",
    
    // 页脚配置
    footer: "MIT License | Copyright © 2026 DonTalk",
    displayFooter: true,
    
    // 博客相关配置
    blog: {
      intro: "/intro/",
      sidebarDisplay: "mobile",
      medias: {
        GitHub: "https://github.com/dontalk",
      },
    },
    
    // 插件配置
    plugins: {
      // 启用博客功能
      blog: true,
      
      // 搜索功能
      search: {
        maxSuggestions: 10,
        hotKeys: [{ key: "k", ctrl: true }],
      },
      
      // 评论功能（可选）
      // comment: {
      //   provider: "Giscus",
      //   repo: "dontalk/dontalk.github.io",
      //   repoId: "",
      //   category: "Announcements",
      //   categoryId: "",
      // },
      
      // 阅读统计
      readingTime: true,
      
      // 字数统计
      wordCount: true,
    },
  }),

  // 启用永久链接
  shouldPrefetch: false,
});
