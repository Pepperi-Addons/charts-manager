import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddonComponent } from './components/addon/addon.component';
import { ChartsManagerComponent } from './components/charts-manager/charts-manager.component';

// Important for single spa
@Component({
    selector: 'app-empty-route',
    template: '<div></div>',
})
export class EmptyRouteComponent { }

const routes: Routes = [
    {
        path: `settings/:addon_uuid`,
        children: [
            {
                path: 'charts',
                component: AddonComponent,
            },
            {
                path: 'charts/:chart_uuid',
                component: ChartsManagerComponent
            },

        ]
    },
    {
        path: '**',
        component: EmptyRouteComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }



