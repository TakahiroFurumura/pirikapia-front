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
      { path: 'image-bookmarks',
        name: 'image-bookmarks',
        component: () => import('pages/ImageBookmarks.vue'),
      },
      { path: 'novel-edit',
        name: 'novel-edit',
        component: () => import('pages/NovelEditBook.vue'),
      },
      { path: 'novel-edit/:bookId',
        name: 'novel-edit-book',
        component: () => import('pages/NovelEditBook.vue'),
      },
      { path: 'novel-auther-home', // This will be accessible at yoursite.com/profile
        name: 'novel-auther-home', // A unique name for this route (recommended)
        component: () => import('pages/NovelAutherHome.vue'),
      },
      { path: 'novel-chapter', // This will be accessible at yoursite.com/profile
        name: 'novel-chapter', // A unique name for this route (recommended)
        component: () => import('pages/NovelChapter.vue'),
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
