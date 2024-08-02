import { Component } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatSelectModule, MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    RouterLink],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {
  activeButton: string | null = 'dashboard';

  onButtonClick(buttonName: string) {
    this.activeButton = buttonName;
  }
}
