import 'package:flutter/material.dart';
import '../utils/app_colors.dart';

class FilterSidebar extends StatefulWidget {
  final List<Map<String, dynamic>> allProducts;
  final void Function(
    Map<String, Set<String>> selectedFilters,
    String? minPrice,
    String? maxPrice,
  )
  onFilterChange;

  const FilterSidebar({
    super.key,
    required this.allProducts,
    required this.onFilterChange,
  });

  @override
  State<FilterSidebar> createState() => _FilterSidebarState();
}

class _FilterSidebarState extends State<FilterSidebar> {
  Map<String, Set<String>> selectedFilters = {
    'category': {},
    'department': {},
    'material': {},
    'provider': {},
  };
  String? selectedMinPrice;
  String? selectedMaxPrice;

  final List<Map<String, dynamic>> priceRanges = [
    {'label': 'Até R\$100', 'min': 0, 'max': 100},
    {'label': 'R\$101 – R\$200', 'min': 101, 'max': 200},
    {'label': 'R\$201 – R\$300', 'min': 201, 'max': 300},
    {'label': 'R\$301 – R\$400', 'min': 301, 'max': 400},
    {'label': 'R\$401 – R\$500', 'min': 401, 'max': 500},
    {'label': 'R\$501 – R\$600', 'min': 501, 'max': 600},
    {'label': 'R\$601 – R\$700', 'min': 601, 'max': 700},
    {'label': 'R\$701 – R\$800', 'min': 701, 'max': 800},
    {'label': 'R\$801 – R\$900', 'min': 801, 'max': 900},
    {'label': 'R\$901 – R\$1000', 'min': 901, 'max': 1000},
    {'label': 'Acima de R\$1000', 'min': 1001, 'max': double.infinity},
  ];

  Map<String, int> getGroupedCounts(String key) {
    final counts = <String, int>{};
    for (final product in widget.allProducts) {
      final value = product[key]?.toString() ?? 'Desconhecido';
      counts[value] = (counts[value] ?? 0) + 1;
    }
    return counts;
  }

  List<Map<String, dynamic>> getPriceRangeCounts() {
    return priceRanges.map((range) {
      final count = widget.allProducts.where((product) {
        final priceRaw = product['price'] ?? product['preco'] ?? 0;
        final price = double.tryParse(priceRaw.toString()) ?? 0.0;
        return price >= range['min'] && price <= range['max'];
      }).length;
      return {...range, 'count': count};
    }).toList();
  }

  void toggleFilter(String key, String value) {
    setState(() {
      if (selectedFilters[key]?.contains(value) ?? false) {
        selectedFilters[key]?.remove(value);
      } else {
        selectedFilters[key]?.add(value);
      }
      widget.onFilterChange(
        selectedFilters,
        selectedMinPrice,
        selectedMaxPrice,
      );
    });
  }

  void togglePriceRange(String min, String max) {
    setState(() {
      if (selectedMinPrice == min && selectedMaxPrice == max) {
        selectedMinPrice = null;
        selectedMaxPrice = null;
      } else {
        selectedMinPrice = min;
        selectedMaxPrice = max;
      }
      widget.onFilterChange(
        selectedFilters,
        selectedMinPrice,
        selectedMaxPrice,
      );
    });
  }

  Widget buildFilterList(String title, Map<String, int> data, String key) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final sortedKeys = data.keys.toList()..sort();
    final accentColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightSecondPurple;

    final textColor = isDark
        ? AppColors.secondFontColor
        : AppColors.lightSecondFontColor;

    return ExpansionTile(
      title: Text(
        title,
        style: TextStyle(fontWeight: FontWeight.bold, color: accentColor),
      ),
      children: sortedKeys.map((item) {
        final isChecked = selectedFilters[key]?.contains(item) ?? false;

        return CheckboxListTile(
          title: Text(
            '$item (${data[item]})',
            style: TextStyle(color: textColor),
          ),
          value: isChecked,
          onChanged: (_) => toggleFilter(key, item),
          controlAffinity: ListTileControlAffinity.leading,
          activeColor: accentColor,
          checkColor: Colors.white,
        );
      }).toList(),
    );
  }

  Widget buildPriceRanges() {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final rangesWithCounts = getPriceRangeCounts();
    final accentColor = isDark
        ? AppColors.primaryPurple
        : AppColors.lightSecondPurple;

    final textColor = isDark
        ? AppColors.secondFontColor
        : AppColors.lightSecondFontColor;

    return ExpansionTile(
      title: Text(
        'Faixa de Preço',
        style: TextStyle(fontWeight: FontWeight.bold, color: accentColor),
      ),
      children: rangesWithCounts.map((range) {
        final isChecked =
            selectedMinPrice == range['min'].toString() &&
            selectedMaxPrice == range['max'].toString();

        return CheckboxListTile(
          title: Text(
            '${range['label']} (${range['count']})',
            style: TextStyle(color: textColor),
          ),
          value: isChecked,
          onChanged: (_) => togglePriceRange(
            range['min'].toString(),
            range['max'].toString(),
          ),
          controlAffinity: ListTileControlAffinity.leading,
          activeColor: accentColor,
          checkColor: Colors.white,
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categories = getGroupedCounts('category');
    final departments = getGroupedCounts('department');
    final materials = getGroupedCounts('material');
    final providers = getGroupedCounts('provider');

    return Drawer(
      child: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                buildFilterList('Categoria', categories, 'category'),
                buildFilterList('Departamento', departments, 'department'),
                buildFilterList('Material', materials, 'material'),
                buildPriceRanges(),
                buildFilterList('Fornecedor', providers, 'provider'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
