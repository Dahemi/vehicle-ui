import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

interface RepairRecord {
  id: string;
  vin: string;
  repair_description: string;
  repair_cost: number;
  status: string;
  mechanic_name?: string;
  created_at: string;
  updated_at: string;
}

// Query to get all VINs from repair records database
const GET_ALL_REPAIR_VINS = gql`
  query GetAllRepairVINs {
    findAllRepairVINs
  }
`;

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

@Component({
  selector: 'app-vin-repair-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule, NzTableModule],
  templateUrl: './vin-repair-lookup.html',
  styleUrls: ['./vin-repair-lookup.css']
})
export class VinRepairLookup implements OnInit {
  vins: string[] = [];
  selectedVin: string | null = null;
  repairRecords: RepairRecord[] = [];
  isLoadingVins = true;
  isLoadingRecords = false;
  error: string | null = null;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.fetchVINs();
  }

  fetchVINs(): void {
    this.isLoadingVins = true;
    this.apollo
      .watchQuery<{ findAllRepairVINs: string[] }>({
        query: GET_ALL_REPAIR_VINS,
      })
      .valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.isLoadingVins = loading;
          if (data?.findAllRepairVINs) {
            this.vins = data.findAllRepairVINs as string[];
            this.error = null;
          }
        },
        error: (err) => {
          this.isLoadingVins = false;
          this.error = 'Failed to load VINs. Please try again.';
          console.error('GraphQL error:', err);
        },
      });
  }

  onVinChange(vin: string): void {
    if (!vin) {
      this.repairRecords = [];
      return;
    }

    this.isLoadingRecords = true;
    this.error = null;
    
    this.apollo
      .watchQuery<{ findRepairRecordByVIN: RepairRecord[] }>({
        query: GET_REPAIR_RECORDS_BY_VIN,
        variables: { vin },
      })
      .valueChanges.subscribe({
        next: ({ data, loading }) => {
          this.isLoadingRecords = loading;
          if (data?.findRepairRecordByVIN) {
            this.repairRecords = data.findRepairRecordByVIN as RepairRecord[];
            this.error = null;
          }
        },
        error: (err) => {
          this.isLoadingRecords = false;
          this.error = 'Failed to load repair records. Please try again.';
          console.error('GraphQL error:', err);
        },
      });
  }
}