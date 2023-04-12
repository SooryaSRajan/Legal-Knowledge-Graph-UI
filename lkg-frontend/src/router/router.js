import { createWebHistory, createRouter } from "vue-router";
import Queries from "@/views/Queries.vue";
import Visualization from "@/views/Visualization.vue";


const routes = [
    {
        path: "/",
        name: "Queries",
        component: Queries,
    },
    {
        path: "/visualization",
        name: "Visualization",
        component: Visualization,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;