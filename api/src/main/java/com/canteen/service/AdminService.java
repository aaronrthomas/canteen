package com.canteen.service;

import com.canteen.dto.DashboardDto;
import com.canteen.entity.Order;
import com.canteen.entity.User;
import com.canteen.repository.OrderRepository;
import com.canteen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public DashboardDto getDashboard() {
        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIDNIGHT);

        long totalUsers = userRepository.countByRole(User.Role.STUDENT);
        long todaysOrders = orderRepository.countTodaysOrders(startOfDay);
        BigDecimal todaysRevenue = orderRepository.sumTodaysRevenue(startOfDay);
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long preparingOrders = orderRepository.countByStatus(Order.OrderStatus.PREPARING);
        long readyOrders = orderRepository.countByStatus(Order.OrderStatus.READY);

        BigDecimal avgOrderValue = todaysOrders > 0
                ? todaysRevenue.divide(BigDecimal.valueOf(todaysOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return DashboardDto.builder()
                .totalUsers(totalUsers)
                .todaysOrders(todaysOrders)
                .todaysRevenue(todaysRevenue)
                .pendingOrders(pendingOrders)
                .preparingOrders(preparingOrders)
                .readyOrders(readyOrders)
                .averageOrderValue(avgOrderValue)
                .build();
    }
}
