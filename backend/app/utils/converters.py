import re


class CaseConverter:
    @staticmethod
    def camel_to_snake(name):
        """
        Convert camelCase string to snake_case.
        """
        s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
        return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()

    @staticmethod
    def snake_to_camel(name):
        """
        Convert snake_case string to camelCase, starting with a lowercase letter.
        """
        components = name.split("_")
        return components[0].lower() + "".join(x.title() for x in components[1:])

    @staticmethod
    def dict_snake_to_camel(data):
        """
        Convert dictionary keys from snake_case to camelCase.
        """
        return {CaseConverter.snake_to_camel(k): v for k, v in data.items()}

    @staticmethod
    def dict_camel_to_snake(data):
        """
        Convert dictionary keys from camelCase to snake_case.
        """
        return {CaseConverter.camel_to_snake(k): v for k, v in data.items()}
