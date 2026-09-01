package cl.labtab.api.common.converters;

import cl.labtab.api.common.OpeningHoursDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class OpeningHoursConverter implements AttributeConverter<OpeningHoursDTO, String> {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(OpeningHoursDTO attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not serialize OpeningHoursDTO to JSON", e);
        }
    }

    @Override
    public OpeningHoursDTO convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(dbData, OpeningHoursDTO.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not deserialize OpeningHoursDTO from JSON", e);
        }
    }
}
