export const getCloudfrontUrl = (path: any) => {
  const base = import.meta.env.VITE_CLOUDFRONT_URL;
  return `${base}/${path}`;
};
