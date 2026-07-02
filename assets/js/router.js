// router.js — dùng chung cho index.html và list-de.html
export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function isValidSubject(slug, subjects) {
  return !!slug && subjects.some(s => s.slug === slug);
}

export function isValidBoDe(id, mon, boDeList) {
  return !!id && boDeList.some(b => b.id === id && b.mon === mon);
}
