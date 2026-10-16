import { productById } from "./products";
import applicationImages from "./application-images.json" with { type: "json" };

// Category images must reuse a real catalog entry, never a generic package drawing.
export const categoryImageModels: Record<string, string> = {
  crystal: "mhz-range-crystal-xy-type",
  oscillator: "mhz-range-crystal-oscillators-ox-type",
  vcxo: "fastvcxo-fast-delivery-vcxo-series-va-m-cmos-type",
  tcxo: "standard-tcxo-series-ty-type",
  ocxo: "standard-ocxo-series-na-type",
};

export function categoryImageProduct(category: string) {
  const product = productById.get(categoryImageModels[category]);
  if (!product || product.category !== category) {
    throw new Error(`Missing official category image: ${category}`);
  }
  return product;
}

export function applicationImage(application: string) {
  const images: Record<
    string,
    (typeof applicationImages.images)["communications"]
  > = applicationImages.images;
  const image = images[application];
  if (!image)
    throw new Error(`Missing official application image: ${application}`);
  return image;
}
