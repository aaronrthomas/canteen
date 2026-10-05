package com.canteen.service;

import com.canteen.dto.FoodDto;
import com.canteen.entity.Category;
import com.canteen.entity.FoodItem;
import com.canteen.exception.ApiException;
import com.canteen.repository.CategoryRepository;
import com.canteen.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;

    public List<FoodDto.Response> getAllFood(String search, Long categoryId, Boolean vegetarian, Boolean available) {
        return foodItemRepository.findWithFilters(search, categoryId, vegetarian, available)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public FoodDto.Response getFoodById(Long id) {
        return toResponse(findById(id));
    }

    public FoodDto.Response createFood(FoodDto.Request request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));

        FoodItem food = FoodItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .imageUrl(request.getImageUrl())
                .preparationTime(request.getPreparationTime() != null ? request.getPreparationTime() : 10)
                .available(request.isAvailable())
                .vegetarian(request.isVegetarian())
                .ingredients(request.getIngredients())
                .allergens(request.getAllergens())
                .build();

        return toResponse(foodItemRepository.save(food));
    }

    public FoodDto.Response updateFood(Long id, FoodDto.Request request) {
        FoodItem food = findById(id);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));

        food.setName(request.getName());
        food.setDescription(request.getDescription());
        food.setPrice(request.getPrice());
        food.setCategory(category);
        food.setImageUrl(request.getImageUrl());
        food.setPreparationTime(request.getPreparationTime() != null ? request.getPreparationTime() : food.getPreparationTime());
        food.setAvailable(request.isAvailable());
        food.setVegetarian(request.isVegetarian());
        food.setIngredients(request.getIngredients());
        food.setAllergens(request.getAllergens());

        return toResponse(foodItemRepository.save(food));
    }

    public void deleteFood(Long id) {
        foodItemRepository.delete(findById(id));
    }

    public FoodDto.Response toggleAvailability(Long id) {
        FoodItem food = findById(id);
        food.setAvailable(!food.isAvailable());
        return toResponse(foodItemRepository.save(food));
    }

    private FoodItem findById(Long id) {
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new ApiException("Food item not found", HttpStatus.NOT_FOUND));
    }

    public FoodDto.Response toResponse(FoodItem food) {
        return FoodDto.Response.builder()
                .id(food.getId())
                .categoryId(food.getCategory() != null ? food.getCategory().getId() : null)
                .categoryName(food.getCategory() != null ? food.getCategory().getName() : null)
                .name(food.getName())
                .description(food.getDescription())
                .price(food.getPrice())
                .imageUrl(food.getImageUrl())
                .preparationTime(food.getPreparationTime())
                .available(food.isAvailable())
                .vegetarian(food.isVegetarian())
                .rating(food.getRating())
                .totalRatings(food.getTotalRatings())
                .ingredients(food.getIngredients())
                .allergens(food.getAllergens())
                .build();
    }
}
