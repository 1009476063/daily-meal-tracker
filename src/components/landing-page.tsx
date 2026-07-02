"use client";

import Link from "next/link";

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5 transition hover:shadow-md">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-3 text-[16px] font-semibold text-[#141613] dark:text-[#e8e6e0]">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-[#5a615c] dark:text-[#9ca3af]">{desc}</p>
    </div>
  );
}

export function LandingPage() {
  const steps = [
    { title: "多图上传", description: "支持同时上传多张食物照片，从不同角度拍摄同一餐食，AI 综合分析。" },
    { title: "AI 精准识别", description: "基于中国食物成分表，识别菜名、食材、份量，计算 13 项营养指标，且识别结果可在线编辑后再保存。" },
    { title: "营养追踪", description: "月日历记录、日/周/月监控卡、营养趋势图、进度条对比中国膳食指南推荐量。" },
  ];

  const features = [
    { icon: "📸", title: "多图识别", desc: "支持每餐上传多张照片，AI 综合多角度图片精准识别食物和份量。" },
    { icon: "🔬", title: "13 项营养指标", desc: "能量、蛋白质、脂肪、碳水、膳食纤维、饱和脂肪、钠、钙、铁、维生素A/C、糖、胆固醇，全面覆盖。" },
    { icon: "🤖", title: "自定义 AI 模型", desc: "支持配置不同的 AI 服务和模型（GPT-4o、Claude 等），一键测试连接。" },
    { icon: "👥", title: "多人食识别", desc: "AI 自动判断用餐人数，支持手动调整，按人数准确估算营养摄入。" },
    { icon: "📅", title: "月日历视图", desc: "以月历形式查看每天饮食记录，按早/午/晚/加餐顺序展示。" },
    { icon: "📈", title: "营养趋势", desc: "按月展示能量、蛋白质、脂肪、碳水、膳食纤维、钠等趋势，快速识别波动。" },
    { icon: "🧾", title: "膳食报告与导出", desc: "生成月度膳食报告并可导出 CSV，便于复查和分享。" },
    { icon: "📴", title: "离线能力", desc: "支持基础离线缓存和 PWA，弱网下仍可顺畅访问。" },
    { icon: "💡", title: "搭配建议", desc: "每餐提供营养均衡度评价、食物搭配改善建议和饮食结构调整方案。" },
    { icon: "🌙", title: "亮暗主题", desc: "支持亮色/暗色主题切换，跟随系统偏好自动适应。" },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0f1412] text-[#141613] dark:text-[#e8e6e0]">
      <header className="sticky top-0 z-10 border-b border-[#e4e5e1]/70 dark:border-[#2d3b36] bg-[#faf9f5]/80 dark:bg-[#0f1412]/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="text-lg font-semibold tracking-tight">Daily Meal</span>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] px-4 py-2 text-[#5a615c] dark:text-[#9ca3af] hover:text-[#141613] dark:hover:text-[#e8e6e0]">登录</Link>
            <Link href="/register" className="rounded-full bg-[#1f5e4b] dark:bg-[#166534] px-4 py-2 text-white hover:bg-[#17493b] dark:hover:bg-[#14532d]">注册</Link>
          </div>
        </div>
      </header>
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-20 text-center md:pb-20 md:pt-28">
          <span className="inline-block rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-3 py-1 text-[12px] font-medium text-[#5a615c] dark:text-[#9ca3af]">每日饮食记录 · AI 精准识别 · 13 项营养指标</span>
          <h1 className="mx-auto mt-7 max-w-2xl text-[34px] font-semibold leading-[1.15] tracking-tight text-[#141613] dark:text-[#e8e6e0] sm:text-[44px]">
            记录每一餐，<span className="text-[#1f5e4b] dark:text-[#4ade80]">让营养更清晰</span>
          </h1>
          <p className="mx-auto mt-6 max-w-prose text-[15px] leading-relaxed text-[#5a615c] dark:text-[#9ca3af]">
            Daily Meal Tracker 帮你用照片快速建立饮食记录，基于《中国食物成分表》AI 精准识别食物并计算 13 项营养指标，提供搭配建议和健康预警，让你全面掌握每日营养摄入。
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-[#1f5e4b] dark:bg-[#166534] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#17493b] dark:hover:bg-[#14532d]">立即开始记录</Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] px-6 py-2.5 text-sm font-medium text-[#141613] dark:text-[#e8e6e0] transition hover:bg-[#faf9f5] dark:hover:bg-[#151e1b]">已有账号登录</Link>
          </div>
        </section>

        {/* Steps */}
        <section className="px-5 pb-16 md:pb-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-8 shadow-sm md:p-12">
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a615c] dark:text-[#9ca3af]">核心流程</span>
              <h2 className="mt-4 text-[28px] font-semibold leading-[1.2] tracking-tight text-[#141613] dark:text-[#e8e6e0] md:text-[32px]">三步完成一份<span className="text-[#1f5e4b] dark:text-[#4ade80]">完整记录</span></h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="rounded-2xl border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-5">
                  <div className="font-mono text-[13px] text-[#1f5e4b] dark:text-[#4ade80]">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="mt-3 text-[18px] font-semibold text-[#141613] dark:text-[#e8e6e0]">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#5a615c] dark:text-[#9ca3af]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-5 pb-16 md:pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a615c] dark:text-[#9ca3af]">产品特性</span>
              <h2 className="mt-4 text-[28px] font-semibold leading-[1.2] tracking-tight text-[#141613] dark:text-[#e8e6e0] md:text-[32px]">全面的<span className="text-[#1f5e4b] dark:text-[#4ade80]">营养管理</span>能力</h2>
              <p className="mx-auto mt-3 max-w-prose text-[14px] text-[#5a615c] dark:text-[#9ca3af]">基于中国居民膳食指南和食物成分表，覆盖从识别到追踪的完整链路</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
              ))}
            </div>
          </div>
        </section>

        {/* Nutrition Indicators */}
        <section className="px-5 pb-16 md:pb-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#e4e5e1] dark:border-[#2d3b36] bg-white dark:bg-[#1a2120] p-8 shadow-sm md:p-12">
            <div className="text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5a615c] dark:text-[#9ca3af]">营养指标</span>
              <h2 className="mt-4 text-[28px] font-semibold leading-[1.2] tracking-tight text-[#141613] dark:text-[#e8e6e0] md:text-[32px]">13 项<span className="text-[#1f5e4b] dark:text-[#4ade80]">全面覆盖</span></h2>
              <p className="mx-auto mt-3 max-w-prose text-[14px] text-[#5a615c] dark:text-[#9ca3af]">参照《中国居民膳食营养素参考摄入量》标准，每餐自动计算</p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {["能量", "蛋白质", "脂肪", "碳水化合物", "膳食纤维", "饱和脂肪", "钠", "钙", "铁", "维生素C", "维生素A", "糖", "胆固醇"].map((name) => (
                <span key={name} className="rounded-full border border-[#e4e5e1] dark:border-[#2d3b36] bg-[#faf9f5] dark:bg-[#151e1b] px-4 py-2 text-sm text-[#141613] dark:text-[#e8e6e0]">{name}</span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#e4e5e1] dark:border-[#2d3b36] bg-[#141613] px-5 py-10 text-center text-[#d5d3cb]">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="text-base font-semibold text-white">Daily Meal Tracker</div>
          <p className="text-[13px] leading-relaxed text-white/60">用照片记录饮食，用 AI 精准识别营养，让每一餐都更健康。</p>
        </div>
      </footer>
    </div>
  );
}
