import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogComponent } from './blog.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', 
    component: BlogComponent,
    children: [
      { path: 'blogslist', component: BlogListComponent },
      { path: 'blog/:id', component: BlogDetailComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'blogslist', pathMatch: 'full' }
    ]
   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }