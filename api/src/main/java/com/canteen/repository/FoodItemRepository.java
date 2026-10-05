package com.canteen.repository;

import com.canteen.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByCategoryId(Long categoryId);
    List<FoodItem> findByAvailableTrue();

    @Query("SELECT f FROM FoodItem f WHERE " +
           "(:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR f.category.id = :categoryId) AND " +
           "(:vegetarian IS NULL OR f.vegetarian = :vegetarian) AND " +
           "(:available IS NULL OR f.available = :available)")
    List<FoodItem> findWithFilters(
        @Param("search") String search,
        @Param("categoryId") Long categoryId,
        @Param("vegetarian") Boolean vegetarian,
        @Param("available") Boolean available
    );

    @Query("SELECT f FROM FoodItem f WHERE f.available = true ORDER BY f.rating DESC")
    List<FoodItem> findTopRated();

    @Query("SELECT f FROM FoodItem f WHERE f.available = true AND f.vegetarian = true ORDER BY f.rating DESC")
    List<FoodItem> findPopularVeg();
}
