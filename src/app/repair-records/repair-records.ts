import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Vehicle } from '../vehicle-list/vehicle-list';

export interface RepairRecord {
  id: string;
  vin: string;
  repair_description: string;
  repair_cost: number;
  status: string;
  mechanic_name?: string;
  created_at: string;
  updated_at: string;
}

const GET_VEHICLE_WITH_REPAIRS = gql`
  query GetVehicleByVIN($vin: String!) {
    findVehicleByVIN(vin: $vin) {
      vin
      first_name
      last_name
      email
      car_make
      car_model
      manufactured_date
      age_of_vehicle
      repairRecords {
        id
        vin
        repair_description
        repair_cost
        status
        mechanic_name
        created_at
        updated_at
      }
    }
  }
`;

@Component({
  selector: 'app-repair-record-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NzTableModule, 
    NzInputModule, 
    NzCardModule
  ],
  templateUrl: './repair-records.html',
  styleUrls: ['./repair-records.css'],
})

export class RepairRecordList {
  records: RepairRecord[] = [];
  vehicle: Vehicle | null = null;
  isLoading = false;
  error: string | null = null;
  searchVIN = '';
  hasSearched = false;

  constructor(private apollo: Apollo) {}

  onSearch(): void {
    if (!this.searchVIN.trim()) {
      this.error = 'Please enter a VIN';
      return;
    }

    this.hasSearched = true;
    this.isLoading = true;
    this.error = null;
    this.vehicle = null;
    this.records = [];


    this.apollo
      .query<{ findVehicleByVIN: Vehicle & { repairRecords: RepairRecord[] } | null }>({
        query: GET_VEHICLE_WITH_REPAIRS,
        variables: { vin: this.searchVIN.trim() },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next: ({ data }) => {
          this.isLoading = false;
          
          if (data?.findVehicleByVIN) {
            // Extract vehicle data
            const { repairRecords, ...vehicleData } = data.findVehicleByVIN;
            this.vehicle = vehicleData as Vehicle;
            
            // Extract repair records
            this.records = repairRecords || [];
            
            if (this.records.length === 0) {
              this.error = `No repair records found for VIN: ${this.searchVIN}`;
            }
          } else {
            this.error = `No vehicle found with VIN: ${this.searchVIN}`;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Failed to load data. Please try again.';
          console.error('GraphQL error:', err);
        },
      });
  }

  clearSearch(): void {
    this.searchVIN = '';
    this.records = [];
    this.error = null;
    this.hasSearched = false;
    this.vehicle = null;
  }
}