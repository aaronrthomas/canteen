package com.canteen.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardDto {
    private long totalUsers;
    private long todaysOrders;
    private BigDecimal todaysRevenue;
    private long pendingOrders;
    private long preparingOrders;
    private long readyOrders;
    private BigDecimal averageOrderValue;
}
