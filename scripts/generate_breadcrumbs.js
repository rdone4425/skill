/**
 * 面包屑导航生成工具
 * 用于在分类页和详情页生成结构化的面包屑数据
 */

function generateBreadcrumbs(type, data) {
  const crumbs = [
    { label: '首页', url: '/' }
  ];

  if (type === 'category') {
    crumbs.push({
      label: data.categoryLabel || data.categoryId,
      url: `/categories/${data.categoryId}/`
    });
  } else if (type === 'skill') {
    if (data.categoryId) {
      crumbs.push({
        label: data.categoryLabel || data.categoryId,
        url: `/categories/${data.categoryId}/`
      });
    }
    crumbs.push({
      label: data.skillName,
      url: `/skill/${encodeURIComponent(data.skillName)}/`
    });
  }

  return crumbs;
}

function renderBreadcrumbs(crumbs) {
  const items = crumbs.map((crumb, index) => {
    const isLast = index === crumbs.length - 1;
    if (isLast) {
      return `<li class="breadcrumb-item active" aria-current="page">${crumb.label}</li>`;
    }
    return `<li class="breadcrumb-item"><a href="${crumb.url}">${crumb.label}</a></li>`;
  });

  return `<nav aria-label="breadcrumb"><ol class="breadcrumb">${items.join('')}</ol></nav>`;
}

// Schema.org BreadcrumbList
function generateBreadcrumbSchema(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.label,
      "item": `https://skill.442595.xyz${crumb.url}`
    }))
  };
}

module.exports = { generateBreadcrumbs, renderBreadcrumbs, generateBreadcrumbSchema };
