// 发布到小红书接口
export async function publishToXHS({ title, content, topics, location, images }: {
  title: string;
  content: string;
  topics: string[];
  location?: string;
  images: string[];
}) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  topics.forEach(t => formData.append('topics', t));
  formData.append('location', location || '');
  images.forEach(url => formData.append('images', url));

  const resp = await fetch('/publish/entity', {
    method: 'POST',
    body: formData,
  });
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  return resp.json();
}

// 新增：发布到小红书接口（JSON版）
export async function publishToXHSJson({ title, content, topics, images, videos, location }: {
  title: string;
  content: string;
  topics: string[];
  images: string[];
  videos?: string[];
  location?: string;
}) {
  const resp = await fetch('/publish/path', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content,
      topics,
      images,
      videos: videos || null,
      location: location || '',
    }),
  });
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  return resp.json();
}

// 新增：fetch_url 接口封装
export async function fetchUrlContent(url: string): Promise<{summary: string}> {
  const resp = await fetch('/fetch-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  // 后端返回的内容结构可能包含 summary/highlight 等
  return resp.json();
}

// 新增：summary-content 接口封装
export async function fetchSummaryContent(content1: string, content2: string): Promise<{summary: string}> {
  const resp = await fetch('/summary-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content1, content2 }),
  });
  if (!resp.ok) {
    let errMsg = await resp.text();
    try {
      const errJson = JSON.parse(errMsg);
      errMsg = errJson.detail || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  return resp.json();
} 