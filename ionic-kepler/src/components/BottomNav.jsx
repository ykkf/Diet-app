import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Utensils, Scale, User, Settings2 } from 'lucide-react';
import './BottomNav.css';

const navItems = [
    { path: '/home', icon: Home, label: 'ホーム' },
    { path: '/meals', icon: Utensils, label: '食事記録' },
    { path: '/weight', icon: Scale, label: '体重記録' },
    { path: '/foods', icon: User, label: '食品管理' }, // TODO: Better icon maybe? Or keep User
    { path: '/settings', icon: Settings2, label: '設定' },
];

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={24} />
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default BottomNav;
