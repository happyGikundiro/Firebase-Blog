import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogRoutingModule } from './blog-routing.module';
import { BlogComponent } from './blog.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { BlogFormComponent } from './blog-form/blog-form.component';
import { SpinnerComponent } from './spinner/spinner.component';

@NgModule({
  declarations: [
    BlogComponent,
    BlogListComponent,
    BlogDetailComponent,
    ProfileComponent,
    NavbarComponent,
    BlogFormComponent,
    SpinnerComponent,
  ],
  imports: [
    CommonModule,
    BlogRoutingModule,
    ReactiveFormsModule
  ]
})
export class BlogModule { }