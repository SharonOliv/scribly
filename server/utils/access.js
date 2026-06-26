const hasAccess = (document, userId) => {
  if (!document || !userId) return false;
  if (document.owner?.toString() === userId.toString()) return true;
  return (document.sharedWith || []).some((id) => id.toString() === userId.toString());
};

module.exports = { hasAccess };
