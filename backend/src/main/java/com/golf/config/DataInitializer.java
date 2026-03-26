package com.golf.config;

import com.golf.model.Charity;
import com.golf.model.User;
import com.golf.repository.CharityRepository;
import com.golf.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CharityRepository charityRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CharityRepository charityRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.charityRepository = charityRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            seedCharities();
            seedAdminUser();
        } catch (Exception e) {
            log.error("Data initialization failed: {}", e.getMessage());
        }
    }

    private void seedCharities() {
        try {
            if (charityRepository.count() > 0) return;
        } catch (Exception e) {
            log.warn("Could not check charity count, skipping seed: {}", e.getMessage());
            return;
        }

        log.info("Seeding charities...");

        List<Charity> charities = Arrays.asList(
            makeCharity("Green Earth Foundation",
                "Dedicated to environmental conservation and reforestation projects worldwide.",
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
                "Environment"),
            makeCharity("Children First",
                "Supporting underprivileged children with education and healthcare.",
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
                "Children"),
            makeCharity("Ocean Rescue Alliance",
                "Protecting marine ecosystems and cleaning ocean plastic pollution.",
                "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400",
                "Environment"),
            makeCharity("Hunger Relief Network",
                "Providing meals and nutrition programs to food-insecure communities.",
                "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400",
                "Humanitarian"),
            makeCharity("Mental Health Matters",
                "Raising awareness and funding mental health support services.",
                "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
                "Health"),
            makeCharity("Animal Sanctuary Trust",
                "Rescuing and rehabilitating abandoned and abused animals.",
                "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=400",
                "Animals"),
            makeCharity("Education For All",
                "Building schools and providing scholarships in developing nations.",
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
                "Education"),
            makeCharity("Clean Water Initiative",
                "Delivering clean drinking water to remote and rural communities.",
                "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
                "Humanitarian")
        );

        charityRepository.saveAll(charities);
        log.info("Seeded {} charities", charities.size());
    }

    private Charity makeCharity(String name, String description, String imageUrl, String category) {
        Charity c = new Charity();
        c.setName(name);
        c.setDescription(description);
        c.setImageUrl(imageUrl);
        c.setCategory(category);
        c.setIsActive(true);
        return c;
    }

    private void seedAdminUser() {
        try {
            if (userRepository.existsByEmail("admin@golfcharity.com")) return;
        } catch (Exception e) {
            log.warn("Could not check admin user, skipping seed: {}", e.getMessage());
            return;
        }

        log.info("Seeding admin user...");
        Charity firstCharity = charityRepository.findByIsActiveTrue()
                .stream().findFirst().orElse(null);

        User admin = new User();
        admin.setEmail("admin@golfcharity.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setFullName("Admin User");
        admin.setRole(User.Role.ADMIN);
        admin.setCharity(firstCharity);
        admin.setDonationPercentage(10);

        userRepository.save(admin);
        log.info("Admin user created: admin@golfcharity.com / Admin@123");
    }
}
