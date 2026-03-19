import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User, LoginCredentials } from '../models/user.model';

interface MockUser extends User {
  password: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    email: 'alice@semine.com',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Johnson',
    jobTitle: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Oslo, Norway',
    bio: 'Passionate about building beautiful, performant web applications. Angular advocate and open-source contributor. Coffee enthusiast who believes great UX changes lives.',
    skills: ['Angular', 'TypeScript', 'RxJS', 'TailwindCSS', 'Node.js'],
    joinedAt: '2022-03-15T09:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'bob@semine.com',
    password: 'secret456',
    firstName: 'Bob',
    lastName: 'Smith',
    jobTitle: 'Product Manager',
    department: 'Product',
    location: 'Berlin, Germany',
    bio: 'Bridging the gap between business and technology. Obsessed with user research and data-driven decisions. Love hiking and landscape photography on weekends.',
    skills: ['Product Strategy', 'Agile', 'UX Research', 'Roadmapping', 'SQL'],
    joinedAt: '2021-07-01T08:30:00.000Z',
    lastLogin: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class MockApiService {
  private delay(ms: number): Observable<void> {
    return timer(ms + Math.random() * 300).pipe(switchMap(() => of(undefined)));
  }

  login(
    credentials: LoginCredentials
  ): Observable<{ user: User; token: string }> {
    const found = MOCK_USERS.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password
    );

    return this.delay(900).pipe(
      switchMap(() => {
        if (!found) {
          return throwError(() => ({
            message: 'Invalid email or password. Please try again.',
          }));
        }
        const { password: _pw, ...user } = found;
        const token = `mock-jwt-${user.id}-${Date.now()}`;
        return of({ user, token });
      })
    );
  }

  getProfile(token: string): Observable<User> {
    const userId = token.split('-')[2];
    const found = MOCK_USERS.find((u) => u.id === userId);

    return this.delay(600).pipe(
      switchMap(() => {
        if (!found) {
          return throwError(() => ({ message: 'Unauthorized' }));
        }
        const { password: _pw, ...user } = found;
        return of(user);
      })
    );
  }

  updateProfile(token: string, updates: Partial<User>): Observable<User> {
    const userId = token.split('-')[2];
    const index = MOCK_USERS.findIndex((u) => u.id === userId);

    return this.delay(800).pipe(
      switchMap(() => {
        if (index === -1) {
          return throwError(() => ({ message: 'User not found' }));
        }
        MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
        const { password: _pw, ...user } = MOCK_USERS[index];
        return of(user);
      })
    );
  }
}
