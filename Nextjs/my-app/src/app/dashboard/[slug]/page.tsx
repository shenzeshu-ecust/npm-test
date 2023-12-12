
// ~ 采用generateStaticParams生成静态路由列表 取代[slug]这种依赖请求的动态路由方式
// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
    // const posts = await fetch('https://.../posts').then((res) => res.json())
   
    // return posts.map((post) => ({
    //   slug: post.slug,
    // }))
    return [{ slug: '1' }, { slug: '2' }, { slug: '3' }]
  }


// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default function Page({ params }: { params: { slug: string } }) {
    return <div>My Post: {params.slug}</div>
  }