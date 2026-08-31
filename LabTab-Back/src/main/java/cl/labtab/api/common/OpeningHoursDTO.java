package cl.labtab.api.common;

import java.util.Map;

public record OpeningHoursDTO(Map<String, DaySchedule> days) {

    public record DaySchedule(String open, String close) {
    }
}
