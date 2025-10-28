import { ApplicationConfig, inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';
import { provideAnimations } from '@angular/platform-browser/animations'; // ✅ Add this import



export const appConfig: ApplicationConfig = {
  providers: [ 
    provideHttpClient(), 
    provideAnimations(),
    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: 'http://localhost:3000/graphql',
        }),
        cache: new InMemoryCache(),
      };
    }),
    
  ]
};
