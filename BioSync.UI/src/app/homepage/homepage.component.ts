import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { ScheduleComponent } from '../schedule/schedule.component';
import {MatSidenavModule} from '@angular/material/sidenav';


@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SidenavComponent, ScheduleComponent, MatSidenavModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  
}
