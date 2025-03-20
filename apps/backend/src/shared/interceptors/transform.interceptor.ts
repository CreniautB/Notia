import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Intercepteur qui transforme toutes les réponses en format ApiResponse
 * et gère les erreurs de manière standardisée
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      // Transformer les réponses réussies
      map(
        (data: T): ApiResponse<T> => ({
          success: true,
          data,
        }),
      ),

      // Gérer les erreurs
      catchError((error) => {
        if (error instanceof HttpException) {
          // Erreurs HTTP connues (400, 401, 403, etc.)
          const status = error.getStatus();
          const response = error.getResponse() as
            | string
            | { message: string | string[]; error?: string };

          const apiError: ApiResponse = {
            success: false,
            error: {
              code: String(status),
              message:
                typeof response === 'string'
                  ? response
                  : Array.isArray(response.message)
                    ? response.message.join(', ')
                    : response.message || error.message,
              details: typeof response === 'object' ? response : undefined,
            },
          };

          return throwError(() => apiError);
        } else {
          // Erreurs inattendues
          console.error('Erreur non gérée:', error);

          const internalError = new InternalServerErrorException(
            'Une erreur inattendue est survenue',
          );
          const apiError: ApiResponse = {
            success: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Une erreur inattendue est survenue',
            },
          };

          return throwError(() => apiError);
        }
      }),
    );
  }
}
