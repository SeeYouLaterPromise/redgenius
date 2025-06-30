// src/pages/HomePage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const leftCards = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    title: "用此总结",
    tag: "AI爆点卡片展示爆点1"
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80",
    title: "用此选题",
    tag: "AI爆点卡片展示爆点2"
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    title: "高亮笔记",
    tag: "AI爆点卡片展示爆点3"
  }
];

const finalCards = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    title: "夏日清爽穿搭灵感",
    tag: "穿搭"
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    title: "三分钟懒人早餐",
    tag: "美食"
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "治愈系旅行日记",
    tag: "旅行"
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    title: "提升幸福感的小物",
    tag: "好物"
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    title: "小众咖啡馆探店日记",
    tag: "生活"
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    title: "夏日清爽穿搭灵感",
    tag: "穿搭"
  }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/login", {
        method: "POST", // 如果后端用GET可改为GET
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (data.success) {
        navigate("/dashboard");
      } else {
        alert(data.msg || "登录失败，请重试");
      }
    } catch (error) {
      alert("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center">
      {/* 顶部LOGO栏 */}
      <header className="w-full max-w-[1500px] flex items-center py-6 px-8 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gradient-to-br from-[#FF2D5C] to-[#FF5C8A] flex items-center justify-center shadow">
            <span className="text-white text-xl font-extrabold select-none">R</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#222] select-none" style={{fontFamily:'\"SF Pro Display\", \"PingFang SC\", Arial, sans-serif'}}>Red Genius</span>
          <span className="ml-4 text-[#B0B0B0] text-lg font-semibold tracking-widest select-none">AI生成</span>
        </div>
      </header>
      {/* 主体三栏布局 */}
      <main className="w-full max-w-[1500px] flex flex-row gap-12 px-8 mx-auto justify-center items-stretch">
        {/* 主内容区和右侧登录区分为两个独立div并列 */}
        <div className="max-w-[1000px] w-full flex flex-row bg-[#F5F6FB] rounded-3xl p-8 gap-8 shadow-sm">
          {/* 左栏 */}
          <section className="flex flex-col gap-6 flex-shrink-0 w-full lg:w-[340px] mt-4">
            {leftCards.map(card => (
              <div key={card.id} className="rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col relative">
                <div className="h-[160px] w-full overflow-hidden flex items-center justify-center bg-[#F8F9FA]">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                </div>
                <div className="flex flex-col px-6 py-4">
                  <span className="text-base font-semibold text-[#222] mb-2">{card.tag}</span>
                  <button className="w-[100px] h-[32px] rounded-full bg-[#FF5A5A] text-white text-sm font-semibold shadow hover:scale-105 transition-all">{card.title}</button>
                </div>
              </div>
            ))}
          </section>
          {/* 中栏 */}
          <section className="flex-1 flex flex-col gap-6 items-center">
            {/* 导入素材 */}
            <div className="w-full rounded-2xl bg-white shadow border border-[#E5E7EB] flex flex-col p-6 mb-2">
              <div className="text-lg font-bold text-[#222] mb-4">可以实现你的素材自由创作和利用</div>
              <div className="flex gap-2 mb-4">
                <button className="w-[120px] h-[36px] rounded-full bg-[#FF5A5A] text-white text-[15px] font-medium shadow">通过URL导入</button>
                <button className="w-[120px] h-[36px] rounded-full bg-[#F8F9FA] text-[#999] text-[15px] font-medium">本地上传文档</button>
              </div>
              <div className="flex items-center w-full gap-2 mb-2">
                <input className="flex-1 h-[36px] rounded-full border border-[#E5E7EB] px-4 text-[15px] text-[#333] placeholder-[#999] focus:border-[#FF2D5C] outline-none transition bg-white" placeholder="粘贴SSt文档" />
                <button className="w-[80px] h-[36px] rounded-full bg-[#FF5A5A] text-white text-[15px] font-semibold shadow">导入</button>
              </div>
            </div>
            {/* 爆点生成 */}
            <div className="w-full rounded-2xl bg-white shadow border border-[#E5E7EB] flex flex-col p-6 mb-2">
              <div className="text-[16px] font-semibold text-[#222] mb-3 ml-1">工作空间一站式</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center text-[#FF2D5C] font-bold mb-1">AI爆点的爆点 <span className="ml-1 text-xs">(7)</span></div>
                <div className="flex flex-row gap-4">
                  <button className="flex-1 flex items-center justify-between px-6 py-3 rounded-2xl border border-[#FAD2E1] bg-[#FFF5F7] text-[#22223B] font-bold text-[16px] shadow-sm transition-all">
                    <span>领域笔记爆点</span>
                    <span className="ml-2 text-[#FF2D5C] text-lg font-bold">✓</span>
                  </button>
                  <button className="flex-1 flex items-center justify-between px-6 py-3 rounded-2xl border border-[#FAD2E1] bg-[#F7F8FA] text-[#22223B] font-bold text-[16px] shadow-sm transition-all">
                    <span>文案生成</span>
                    <span className="ml-2 text-[#FF2D5C] text-lg font-bold">✓</span>
                  </button>
                </div>
                <div className="flex flex-row gap-4 mt-3">
                  <button className="flex-1 flex items-center justify-between px-6 py-3 rounded-2xl border border-[#FAD2E1] bg-[#F7F8FA] text-[#22223B] font-bold text-[16px] shadow-sm transition-all">
                    <span>图文设计</span>
                    <span className="ml-2 text-[#FF2D5C] text-lg font-bold">✓</span>
                  </button>
                  <button className="flex-1 flex items-center justify-between px-6 py-3 rounded-2xl border border-[#FAD2E1] bg-[#F7F8FA] text-[#22223B] font-bold text-[16px] shadow-sm transition-all">
                    <span>小红书发布</span>
                    <span className="ml-2 text-[#FF2D5C] text-lg font-bold">✓</span>
                  </button>
                </div>
              </div>
            </div>
            {/* 文案列表-小红书爆款文案风格 */}
            <div className="w-full rounded-2xl bg-white shadow border border-[#E5E7EB] flex flex-col p-6 -mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#FF2D5C] font-bold text-lg">讨论笔记</span>
                <button className="text-gray-400 text-sm">上步</button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FFF5F7] hover:shadow transition cursor-pointer">
                  <span className="text-lg select-none">🌿</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#222] mb-0.5">夏日清爽穿搭灵感</span>
                    <span className="text-xs text-[#FF2D5C] font-medium">#小个子穿搭 #显高显瘦</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#F8F9FA] hover:shadow transition cursor-pointer">
                  <span className="text-lg select-none">🍳</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#222] mb-0.5">三分钟懒人早餐，元气满满开启一天！</span>
                    <span className="text-xs text-[#FF2D5C] font-medium">#早餐打卡 #健康美食</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FFF5F7] hover:shadow transition cursor-pointer">
                  <span className="text-lg select-none">✈️</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#222] mb-0.5">治愈系旅行日记：逃离城市的周末</span>
                    <span className="text-xs text-[#FF2D5C] font-medium">#旅行vlog #治愈日常</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#F8F9FA] hover:shadow transition cursor-pointer">
                  <span className="text-lg select-none">🎁</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#222] mb-0.5">提升幸福感的小物推荐</span>
                    <span className="text-xs text-[#FF2D5C] font-medium">#生活好物 #提升幸福感</span>
                  </div>
                </div>
              </div>
              {/* 最终图文流动卡片-整体上移并缩小 */}
              <div className="flex flex-row gap-4 mt-4 justify-center">
                {finalCards.slice(0, 5).map(card => (
                  <div key={card.id} className="w-[160px] h-[210px] rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col">
                    <div className="h-[140px] w-full overflow-hidden flex items-center justify-center bg-[#F8F9FA]">
                      <img src={card.img} alt={card.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
                    </div>
                    <div className="flex flex-col px-3 py-1.5">
                      <span className="text-sm font-semibold text-[#222] mb-0.5 truncate">{card.title}</span>
                      <span className="inline-block bg-[#FF5A5A] text-white text-xs font-medium rounded-full px-2 py-0.5 shadow">{card.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
        {/* 右栏扫码登录区 */}
        <div className="flex flex-col items-center w-[320px] min-w-[320px] ml-72 mt-16">
          <div className="w-full rounded-2xl bg-white shadow-xl border border-[#E5E7EB] flex flex-col justify-center items-center p-8">
            <div className="text-[28px] font-bold text-[#FF2D5C] mb-1 tracking-tight">红书智作</div>
            <div className="text-[18px] text-[#222] font-semibold mb-6">(RedGenius)</div>
            <div className="text-[17px] text-[#999] mb-2">请使用小红书App扫码登录</div>
            <div className="text-[13px] text-[#CCCCCC] mb-6">扫码即登录，安全快捷</div>
            <button
              className="w-full h-[52px] rounded-full bg-gradient-to-r from-[#FF2D5C] to-[#FF5C8A] text-white text-lg font-bold shadow hover:scale-105 transition-all mt-2"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;