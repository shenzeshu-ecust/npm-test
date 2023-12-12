import React from "react";

export default function DashboardLayout({children}: { children: React.ReactNode, })  {
    return (
        <section>
            <nav> 导航</nav>
            { children}
           
        </section>
    )
};
