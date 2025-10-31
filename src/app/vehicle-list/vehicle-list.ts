import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { FormsModule} from '@angular/forms';
import {NzTableModule} from 'ng-zorro-antd/table';
import { NzInputModule} from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';

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

const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle($updateVehicleInput: UpdateVehicleInput!) {
    updateVehicle(updateVehicleInput: $updateVehicleInput) {
      id
      first_name
      last_name
      email
      car_make
      car_model
      vin
      manufactured_date
      age_of_vehicle
    }
  }
`

const DELETE_VEHICLE = gql`
  mutation DeleteVehicle($id: String!){
    deleteVehicle(id: $id){
      id
      vin
    }
  }
`

@Component({
  selector: 'app-vehicle-list',
  imports: [
    CommonModule, 
    FormsModule, 
    NzTableModule, 
    NzInputModule,
    NzModalModule,
    NzButtonModule,
    NzFormModule
  ],
  templateUrl: './vehicle-list.html',
  styleUrls: ['./vehicle-list.css'],
})

export class VehicleList implements OnInit {
  vehicles: Vehicle[] = [];
  isLoading = true;
  isDeleting = false;
  error: string | null = null;

  // pagination
  currentPage = 1;
  pageSize = 10;

  // search
  searchQuery = '';

  // Modal state
  isEditModalVisible = false;
  editingVehicle: Vehicle | null = null;
  isUpdating = false;

  constructor(private apollo: Apollo) {}

  
  ngOnInit(): void {
    this.fetchVehicles();
  }

  fetchVehicles(): void {
    this.isLoading = true;
    this.apollo
      .watchQuery<{ findAllVehicles: Vehicle[] }>({
        query: GET_VEHICLES,
        variables: {
          page: this.currentPage,
          limit: this.pageSize,
          sortBy: 'manufactured_date',
          search: this.searchQuery || null,
        },
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
    this.currentPage = 1;
    this.fetchVehicles();
  }

  nextPage(): void{
    this.currentPage++;
    this.fetchVehicles();
  }

  previousPage(): void{
    if(this.currentPage > 1){
      this.currentPage--;
      this.fetchVehicles();
    }
  }

  // Open edit modal
  onEdit(vehicle: Vehicle): void {
    this.editingVehicle = { ...vehicle }; // Create a copy
    this.isEditModalVisible = true;
  }

  // Close modal without saving
  handleCancelEdit(): void {
    this.isEditModalVisible = false;
    this.editingVehicle = null;
  }

  // Save changes from modal
  handleSaveEdit(): void {
    if (!this.editingVehicle) {
      return;
    }

    // Basic validation
    if (!this.editingVehicle.first_name || !this.editingVehicle.last_name || 
        !this.editingVehicle.email || !this.editingVehicle.car_make || 
        !this.editingVehicle.car_model) {
      alert('Please fill in all required fields.');
      return;
    }

    this.updateVehicle(this.editingVehicle);
  }

  updateVehicle(vehicle: Vehicle): void{
    this.isUpdating = true;
    this.apollo
      .mutate({
        mutation: UPDATE_VEHICLE,
        variables:{
          updateVehicleInput:{
            id: vehicle.id,
            first_name: vehicle.first_name,
            last_name: vehicle.last_name,
            email: vehicle.email,
            car_make: vehicle.car_make,
            car_model: vehicle.car_model,
            vin: vehicle.vin,
            manufactured_date: vehicle.manufactured_date,
          },
        }
      })
      .subscribe({
        next:() =>{
          this.isUpdating = false;
          this.isEditModalVisible = false;
          this.editingVehicle = null;
          this.fetchVehicles();
          alert('Vehicle updated successfully.');
        },
        error:(err) =>{
          this.isUpdating = false;
          console.error('Update error:', err);
          alert('Failed to update vehicle. Please try again.');
        }
      });
  }

  onDelete(id: string): void{
    if(!confirm('Are you sure you want to delete this vehicle?')){
      return;
    }

    this.isDeleting = true;

    this.apollo
      .mutate({
        mutation: DELETE_VEHICLE,
        variables: {id},
      })
      .subscribe({
        next: () =>{
          this.isDeleting = false;
          this.fetchVehicles();
          alert('Vehicle deleted successfully!');
        },
        error: (err) =>{
          this.isDeleting = false;
          console.error('Delete error:', err);
          alert('Failed to delete Vehicle. Please try again.');
        },
      });
  }
}