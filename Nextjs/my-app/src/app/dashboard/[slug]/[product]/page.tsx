// Generate segments for [product] using the `params` passed from
// the parent segment's `generateStaticParams` function
export  async function generateStaticParams({params: {slug}}: {params: { slug: 'string'}}) {
    // const products = await fetch(
    //     `https://.../products?category=${slug}`
    //   ).then((res) => res.json())
     
    //   return products.map((product) => ({
    //     product: product.id,
    //   }))
    return [
      { slug: 'a', product: '1' },
      { slug: 'b', product: '2' },
      { slug: 'c', product: '3' },
    ]
  }
   
  // Three versions of this page will be statically generated
  // using the `params` returned by `generateStaticParams`
  // - /products/a/1
  // - /products/b/2
  // - /products/c/3
  export default function Page({
    params,
  }: {
    params: { slug: string; product: string }
  }) {
    const { slug, product } = params
    return <div>{slug} - {product}</div>
  }