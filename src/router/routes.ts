import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/',
        name: 'home',
        component: () => import('pages/IndexPage.vue') },
      { path: 'image-detail-view/:imageId',
        name: 'image-detail-view', // A unique name for this route (recommended)
        component: () => import('pages/ImageDetailView.vue'),
        props: true
      },
      { path: 'user-profile', // This will be accessible at yoursite.com/profile
        name: 'user-profile', // A unique name for this route (recommended)
        component: () => import('pages/UserProfile.vue'),
      },
      { path: 'user-login',
        name: 'user-login', // A unique name for this route (recommended)
        component: () => import('pages/UserLogin.vue'),
      },
      { path: 'user-sign-up',
        name: 'user-sign-up', // A unique name for this route (recommended)
        component: () => import('pages/UserSignUp.vue'),
      },
      { path: 'user-email-confirmation',
        name: 'user-email-confirmation', // A unique name for this route (recommended)
        component: () => import('pages/UserEmailConfirmation.vue'),
      },
      { path: 'password-reset',
        name: 'password-reset', // A unique name for this route (recommended)
        component: () => import('pages/UserPasswordReset.vue'),
      },
    ],
  },




  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },

];

export default routes;
