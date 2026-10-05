package com.canteen.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

public class FoodDto {

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long categoryId;
        private String categoryName;
        private String name;
        private String description;
        private BigDecimal price;
        private String imageUrl;
        private Integer preparationTime;
        private boolean available;
        private boolean vegetarian;
        private BigDecimal rating;
        private Integer totalRatings;
        private String ingredients;
        private String allergens;
    }

    @Getter @Setter
    public static class Request {
        @NotBlank(message = "Name is required")
        private String name;

        @NotNull(message = "Category is required")
        private Long categoryId;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be positive")
        private BigDecimal price;

        private String imageUrl;
        private Integer preparationTime;
        private boolean available = true;
        private boolean vegetarian = false;
        private String ingredients;
        private String allergens;
    }
}
