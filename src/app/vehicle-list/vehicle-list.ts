import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { FormsModule} from '@angular/forms';

export interface Vehicle {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  car_make: string;
  car_model: string;
  vin: string;
  manufactured_date: string;
  age_of_vehicle: number;
  created_at: string;
}

const GET_VEHICLES = gql`
  query GetVehicles($page: Int!, $limit: Int!, $sortBy: String, $search: String) {
    findAllVehicles(page: $page, limit: $limit, sortBy: $sortBy, search: $search) {
      id
      first_name
      last_name
      email
      car_make
      car_model
      vin
      manufactured_date
      age_of_vehicle
      created_at
    }
  }
`;

@Component({
  selector: 'app-vehicle-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-list.html',
  styleUrls: ['./vehicle-list.css'],
})


export class VehicleList implements OnInit {
  vehicles: Vehicle[] = [];
  isLoading = true;
  error: string | null = null;

  // pagination
  currentPage = 1;
  pageSize = 10;

  // search
  searchQuery = '';

  constructor(private apollo: Apollo) {}

  // fetch data inside OnInit function
  ngOnInit(): void {
    this.apollo
      .watchQuery<{ findAllVehicles: Vehicle[] }>({
        query: GET_VEHICLES,
        variables:{
          page: this.currentPage,
          limit: this.pageSize,
          sortBy: 'manufactured_date',
          search: this.searchQuery || null,
        }
      })
      .valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.isLoading = loading;
          if (data?.findAllVehicles) {
            this.vehicles = (data.findAllVehicles as Vehicle[]) || [];
            this.error = null;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Failed to load vehicles. Please try again.';
          console.error('GraphQL error:', err);
        },
      });
  }

  onSearch(): void{
    this.currentPage = 1; // reset to first page on new search
    this.ngOnInit(); // re-fetch data with new search query
  }

  nextPage(): void{
    this.currentPage++;
    this.ngOnInit(); // re-fetch data for next page
  }

  previousPage(): void{
    if(this.currentPage > 1){
      this.currentPage--;
      this.ngOnInit(); // re-fetch data for previous page
    }
  }
}
