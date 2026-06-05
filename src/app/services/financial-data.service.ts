import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface StatementLine {
  date: string;
  description: string;
  amount: number;
}

export interface Statement {
  statementLines: StatementLine[];
}

export type ApiResponse = Statement[];

export interface FinancialData {
  month: string;
  income: number;
  expenses: number;
}

@Injectable({
  providedIn: 'root',
})
export class FinancialDataService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getFinancialData(): Observable<FinancialData[]> {
    const token = this.authService.getToken();
    console.log(
      '[FinancialDataService] Token check:',
      token ? `Token exists (${token.substring(0, 20)}...)` : 'No token found',
    );
    console.log(
      '[FinancialDataService] Making request to:',
      `${this.apiUrl}/statement`,
    );

    return this.http.get<ApiResponse>(`${this.apiUrl}/statement`).pipe(
      map((response) => this.transformApiResponse(response)),
      catchError((error: HttpErrorResponse) => {
        console.error('[FinancialDataService] API Error:', error);
        console.error('[FinancialDataService] Error status:', error.status);
        console.error('[FinancialDataService] Error headers:', error.headers);
        console.error('[FinancialDataService] Request URL:', error.url);

        if (error.status === 401) {
          return throwError(
            () => new Error('Authentication failed. Please login again.'),
          );
        }

        return throwError(
          () =>
            new Error(
              `Failed to fetch financial data: ${error.message || 'Unknown error'}`,
            ),
        );
      }),
    );
  }

  getRawTransactions(): Observable<StatementLine[]> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/statement`).pipe(
      map((response) => {
        if (!Array.isArray(response) || response.length === 0) {
          return [];
        }

        return response.flatMap((statement) => statement.statementLines || []);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('[FinancialDataService] Raw transactions error:', error);
        return throwError(() => new Error('Failed to fetch raw transactions'));
      }),
    );
  }

  private transformApiResponse(apiResponse: ApiResponse): FinancialData[] {
    console.log('[FinancialDataService] Raw API Response:', apiResponse);
    console.log(
      '[FinancialDataService] Response is array:',
      Array.isArray(apiResponse),
    );

    if (!Array.isArray(apiResponse) || apiResponse.length === 0) {
      console.log('[FinancialDataService] No statements found in response');
      return [];
    }

    const allTransactions = apiResponse.flatMap((statement) => {
      console.log('[FinancialDataService] Processing statement:', statement);
      return statement.statementLines || [];
    });

    console.log('[FinancialDataService] All transactions:', allTransactions);

    const monthlyData: { [key: string]: { income: number; expenses: number } } =
      {};

    allTransactions.forEach((transaction) => {
      if (!transaction.date || transaction.amount === undefined) {
        return;
      }

      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (transaction.amount > 0) {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(transaction.amount);
      }
    });

    const result = Object.entries(monthlyData)
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });

        return {
          month: monthName,
          income: Math.round(data.income * 100) / 100,
          expenses: Math.round(data.expenses * 100) / 100,
          sortDate: date,
        };
      })
      .sort((a, b) => {
        return a.sortDate.getTime() - b.sortDate.getTime();
      })
      .map(({ month, income, expenses }) => ({ month, income, expenses }));

    return result;
  }

  uploadCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/statement/upload`, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('[FinancialDataService] Upload error:', error);

        if (error.status === 401) {
          return throwError(
            () => new Error('Authentication failed. Please login again.'),
          );
        }

        return throwError(
          () => new Error(error.error?.message || 'Failed to upload file'),
        );
      }),
    );
  }
}
