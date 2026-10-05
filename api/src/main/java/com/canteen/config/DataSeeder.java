package com.canteen.config;

import com.canteen.entity.*;
import com.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedData(
            UserRepository userRepo,
            CategoryRepository categoryRepo,
            FoodItemRepository foodRepo) {
        return args -> {
            if (userRepo.count() > 0) {
                log.info("Database already seeded. Skipping.");
                return;
            }
            log.info("Seeding database...");

            // --- USERS ---
            User admin = userRepo.save(User.builder()
                    .name("Admin User").email("admin@canteen.edu")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("9000000001").collegeId("ADMIN001").role(User.Role.ADMIN).build());

            User staff1 = userRepo.save(User.builder()
                    .name("Ravi Kumar").email("staff1@canteen.edu")
                    .password(passwordEncoder.encode("staff123"))
                    .phone("9000000002").collegeId("STAFF001").role(User.Role.STAFF).build());

            User staff2 = userRepo.save(User.builder()
                    .name("Priya Nair").email("staff2@canteen.edu")
                    .password(passwordEncoder.encode("staff123"))
                    .phone("9000000003").collegeId("STAFF002").role(User.Role.STAFF).build());

            String studentPass = passwordEncoder.encode("student123");
            String[][] students = {
                {"Aaron Thomas", "aaron@college.edu", "9111000001", "CS2021001"},
                {"Ananya Sharma", "ananya@college.edu", "9111000002", "CS2021002"},
                {"Rahul Verma", "rahul@college.edu", "9111000003", "EC2021003"},
                {"Sneha Pillai", "sneha@college.edu", "9111000004", "ME2021004"},
                {"Aditya Singh", "aditya@college.edu", "9111000005", "CS2021005"},
                {"Meera Nambiar", "meera@college.edu", "9111000006", "CE2021006"},
                {"Karthik Raja", "karthik@college.edu", "9111000007", "IT2021007"},
                {"Divya Menon", "divya@college.edu", "9111000008", "CS2021008"},
                {"Arjun Patel", "arjun@college.edu", "9111000009", "EC2021009"},
                {"Pooja Iyer", "pooja@college.edu", "9111000010", "ME2021010"},
            };
            for (String[] s : students) {
                userRepo.save(User.builder().name(s[0]).email(s[1])
                        .password(studentPass).phone(s[2]).collegeId(s[3])
                        .role(User.Role.STUDENT).build());
            }

            // --- CATEGORIES ---
            Category breakfast = categoryRepo.save(cat("Breakfast", "Morning meals and snacks", "🍳"));
            Category meals = categoryRepo.save(cat("Meals", "Full course meals", "🍱"));
            Category snacks = categoryRepo.save(cat("Snacks", "Light bites and snacks", "🥪"));
            Category fastFood = categoryRepo.save(cat("Fast Food", "Quick bites", "🍔"));
            Category beverages = categoryRepo.save(cat("Beverages", "Hot and cold drinks", "☕"));
            Category desserts = categoryRepo.save(cat("Desserts", "Sweet treats", "🍰"));

            // --- FOOD ITEMS ---
            List<Object[]> foods = List.of(
                // {name, desc, price, cat, prepTime, veg, rating, ingredients, allergens, image}
                new Object[]{"Chicken Biryani", "Aromatic basmati rice cooked with tender chicken and fragrant spices", 120, meals, 20, false, 4.8, "Basmati rice, chicken, onion, spices, ghee, saffron", "None", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400"},
                new Object[]{"Veg Meals", "Complete south Indian thali with rice, sambar, rasam, and curries", 90, meals, 15, true, 4.5, "Rice, sambar, rasam, dal, vegetables, papad", "Gluten", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"},
                new Object[]{"Chicken Fried Rice", "Wok-tossed rice with chicken, eggs, and vegetables", 110, meals, 15, false, 4.6, "Rice, chicken, egg, soy sauce, vegetables", "Egg, Soy", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"},
                new Object[]{"Gobi Manchurian", "Crispy cauliflower florets in tangy Manchurian sauce", 80, fastFood, 12, true, 4.4, "Cauliflower, maida, soy sauce, chilli sauce, ginger garlic", "Gluten, Soy", "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400"},
                new Object[]{"Chicken Roll", "Spicy chicken filling wrapped in flaky paratha", 70, fastFood, 10, false, 4.7, "Paratha, chicken, onion, capsicum, mint chutney", "Gluten", "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=400"},
                new Object[]{"Samosa", "Crispy pastry filled with spiced potato and peas", 20, snacks, 5, true, 4.3, "Potato, peas, maida, spices, oil", "Gluten", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"},
                new Object[]{"Veg Puff", "Flaky puff pastry filled with spiced mixed vegetables", 25, snacks, 5, true, 4.2, "Puff pastry, mixed vegetables, spices", "Gluten, Dairy", "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400"},
                new Object[]{"Tea", "Hot masala chai with ginger and cardamom", 15, beverages, 3, true, 4.5, "Milk, tea leaves, ginger, cardamom, sugar", "Dairy", "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"},
                new Object[]{"Coffee", "Strong filter coffee with frothy milk", 25, beverages, 5, true, 4.6, "Coffee powder, milk, sugar", "Dairy", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400"},
                new Object[]{"Fresh Lime Soda", "Refreshing lime soda with mint", 30, beverages, 3, true, 4.4, "Lime, soda, mint, sugar, salt", "None", "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"},
                new Object[]{"Cold Coffee", "Chilled coffee with ice cream and milk", 60, beverages, 7, true, 4.7, "Coffee, milk, ice cream, chocolate syrup", "Dairy", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400"},
                new Object[]{"Chocolate Cake", "Rich moist chocolate cake with ganache", 70, desserts, 0, true, 4.8, "Flour, cocoa, eggs, butter, chocolate", "Gluten, Dairy, Egg", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400"},
                new Object[]{"Idli Sambar", "Soft steamed rice cakes with sambar and coconut chutney", 40, breakfast, 10, true, 4.5, "Rice batter, urad dal, sambar, coconut", "None", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400"},
                new Object[]{"Masala Dosa", "Crispy rice crepe with spiced potato filling and chutneys", 55, breakfast, 12, true, 4.7, "Rice batter, potato, onion, mustard seeds, coconut chutney", "None", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400"},
                new Object[]{"Vada", "Crispy lentil doughnuts with sambar and chutney", 35, breakfast, 8, true, 4.3, "Urad dal, onion, curry leaves, oil", "None", "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400"},
                new Object[]{"Paneer Butter Masala", "Creamy tomato-based curry with soft paneer cubes", 100, meals, 15, true, 4.6, "Paneer, tomato, cream, butter, spices", "Dairy", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400"},
                new Object[]{"Chicken Curry Rice", "Home-style chicken curry served with steamed rice", 130, meals, 18, false, 4.7, "Chicken, tomato, onion, spices, rice", "None", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400"},
                new Object[]{"Egg Fried Rice", "Quick stir-fried rice with scrambled eggs and vegetables", 80, meals, 12, false, 4.4, "Rice, egg, vegetables, soy sauce, pepper", "Egg, Soy", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"},
                new Object[]{"Butter Biscuits", "Freshly baked buttery biscuits", 15, snacks, 0, true, 4.2, "Flour, butter, sugar, baking powder", "Gluten, Dairy", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400"},
                new Object[]{"Gulab Jamun", "Soft milk dumplings in rose-flavoured sugar syrup", 40, desserts, 0, true, 4.8, "Khoya, maida, sugar, rose water", "Dairy, Gluten", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"}
            );

            for (Object[] f : foods) {
                FoodItem item = FoodItem.builder()
                        .name((String) f[0])
                        .description((String) f[1])
                        .price(BigDecimal.valueOf((int) f[2]))
                        .category((Category) f[3])
                        .preparationTime((int) f[4])
                        .vegetarian((boolean) f[5])
                        .rating(BigDecimal.valueOf((double) f[6]))
                        .ingredients((String) f[7])
                        .allergens((String) f[8])
                        .imageUrl((String) f[9])
                        .available(true)
                        .build();
                foodRepo.save(item);
            }

            log.info("✅ Database seeded successfully!");
            log.info("Admin: admin@canteen.edu / admin123");
            log.info("Staff: staff1@canteen.edu / staff123");
            log.info("Student: aaron@college.edu / student123");
        };
    }

    private Category cat(String name, String desc, String icon) {
        return Category.builder().name(name).description(desc).imageUrl(icon).build();
    }
}
