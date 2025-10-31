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

const GET_REPAIR_RECORDS_BY_VIN = gql`
  query GetRepairRecordsByVIN($vin: String!) {
    findRepairRecordByVIN(vin: $vin) {
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
`;

const GET_VEHICLE_BY_VIN = gql`
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
    }
  }
`

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

    // Fetch Vehicle Details
    this.apollo
      .query<{ findVehicleByVIN: Vehicle | null }>({
        query: GET_VEHICLE_BY_VIN,
        variables: { vin: this.searchVIN.trim() },
      })
      .subscribe({
        next: ({ data }) => {
          if (data?.findVehicleByVIN) {
            this.vehicle = data.findVehicleByVIN;
          }
        },
        error: (err) => {
          console.error('Error fetching vehicle:', err);
        },
      });

    // Fetch Repair Records
    this.apollo
      .watchQuery<{ findRepairRecordByVIN: RepairRecord[] }>({
        query: GET_REPAIR_RECORDS_BY_VIN,
        variables: {
          vin: this.searchVIN.trim(),
        },
      })
      .valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.isLoading = loading;
          if (data?.findRepairRecordByVIN) {
            this.records = data.findRepairRecordByVIN as RepairRecord[];
            if (this.records.length === 0) {
              this.error = `No repair records found for VIN: ${this.searchVIN}`;
            }
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Failed to load repair records. Please try again.';
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