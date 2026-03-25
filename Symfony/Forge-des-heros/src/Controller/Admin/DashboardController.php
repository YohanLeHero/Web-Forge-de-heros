<?php

namespace App\Controller\Admin;

use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Symfony\Component\HttpFoundation\Response;

#[AdminDashboard(routePath: '/admin', routeName: 'admin')]
class DashboardController extends AbstractDashboardController
{
    public function index(): Response
    {
        // parent::index() shows EasyAdmin’s default “Welcome” page; redirect to real CRUD instead.
        return $this->redirectToRoute('admin_race_index');
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('Forge Des Heros');
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Dashboard', 'fa fa-home');
        yield MenuItem::section('Data');
        yield MenuItem::linkTo(RaceCrudController::class, 'Races', 'fa fa-flag');
        yield MenuItem::linkTo(CharacterClassCrudController::class, 'Classes', 'fa fa-shield');
        yield MenuItem::linkTo(SkillCrudController::class, 'Skills', 'fa fa-star');
        yield MenuItem::section('Users');
        yield MenuItem::linkTo(UserCrudController::class, 'Users', 'fa fa-user');
        yield MenuItem::section('Content');
        yield MenuItem::linkTo(CharacterCrudController::class, 'Characters', 'fa fa-users');
    }
}
